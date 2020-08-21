import React, { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import sanitizeHtml from 'sanitize-html';
import parse from 'html-react-parser';
import Highlight from 'react-highlight';
import { Box, Heading, Image, Main, Text } from 'grommet';
import cheerio from 'cheerio';

import Container from '../../components/Container';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

import { YuqueApi, Doc } from '../../utils/yuque-api';

const CDN_ROOT = 'https://cdn.nlark.com';

interface PostPageProps {
  doc: Doc;
}

interface PostHeaderProps {
  title: string;
  date?: string;
}

const PostHeader: FC<PostHeaderProps> = ({ title, date }: PostHeaderProps) => (
  <Box>
    <Heading level="2" color="dark-1">
      {title}
    </Heading>
    {!date ? null : (
      <Text size="small" color="dark-6">
        {moment(date).tz(moment.tz.guess()).format('LL')}
      </Text>
    )}
  </Box>
);

const PostPage: FC<PostPageProps> = ({ doc }: PostPageProps) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const blog = parse(doc.body_html, {
    replace: (domNode: any) => {
      if (domNode.name && domNode.name === 'img') {
        const { src } = domNode.attribs;
        return <Image src={(src as string).replace(CDN_ROOT, '/img')} fill />;
      }

      if (domNode.attribs && 'data-language' in domNode.attribs) {
        // console.log(domNode);
        const textNode = domNode.children[0].children[0].children[0].children[0];
        // console.log(textNode);
        return <Highlight className={domNode.attribs['data-language']}>{textNode.data}</Highlight>;
      }
    },
  });
  return (
    <>
      <Head>
        <title>{`${doc.title} - ${doc.book.name}`}</title>
      </Head>
      <Container>
        <Main>
          <SiteHeader />
          <Box pad="large">
            <PostHeader title={doc.title} date={doc.created_at} />
            {/* <div dangerouslySetInnerHTML={{ __html }} /> */}
            {blog}
          </Box>
          <SiteFooter />
        </Main>
      </Container>
    </>
  );
};

export default PostPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const api = new YuqueApi(process.env.yuqueToken);

  const { data: currentUser } = await api.getUser();
  const { data: repos } = await api.getRepos(currentUser.login);
  const [blogRepo] = repos.filter((repo) => repo.slug === 'x-tech-blog');
  const { data: docs } = await api.getDocs(blogRepo.namespace);

  const paths: Array<{ params: { [key: string]: string | string[] } }> = docs
    .filter((doc) => doc.status === 1)
    .map((doc) => ({ params: { namespace: blogRepo.namespace, slug: doc.slug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { namespace, slug } }): Promise<{ props: PostPageProps }> => {
  const api = new YuqueApi(process.env.yuqueToken);

  let nsp = namespace as string;

  if (!nsp) {
    const { data: currentUser } = await api.getUser();
    const { data: repos } = await api.getRepos(currentUser.login);
    const [blogRepo] = repos.filter((repo) => repo.slug === 'x-tech-blog');

    nsp = blogRepo.namespace;
  }

  const { data: doc } = await api.getDoc(nsp, slug as string);

  doc.body_html = sanitizeHtml(doc.body_html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
    allowedAttributes: Object.assign(sanitizeHtml.defaults.allowedAttributes, {
      div: (sanitizeHtml.defaults.allowedAttributes.div || []).concat(['data-language']),
    }),
  });

  const $ = cheerio.load(doc.body_html);

  const imgs: string[] = [];

  $('img').each((idx, el) => {
    imgs.push($(el).attr('src'));
  });

  await Promise.all(
    imgs.map((url) => {
      console.log('downloading image', url);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      return import('node-fetch')
        .then((fetch) => fetch.default(url))
        .then((response) => response.buffer())
        .then((buffer) => Promise.all([import('fs-extra'), import('path')]).then(([fs, path]) => {
          const imgPath = path.resolve(process.cwd(), 'public', 'img', url.replace(`${CDN_ROOT}/`, ''));
          console.log('image downloaded to', imgPath);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return fs.outputFile(imgPath, buffer);
        }));
    }),
  );

  return {
    props: {
      doc,
    },
  };
};
