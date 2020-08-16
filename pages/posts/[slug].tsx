import React, { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import sanitizeHtml from 'sanitize-html';
import parse from 'html-react-parser';
import Highlight from 'react-highlight';
import { Box, Heading, Main, Text } from 'grommet';

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

  let postHtml = doc.body_html.replace(CDN_ROOT, '/api/img');
  postHtml = sanitizeHtml(postHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
    allowedAttributes: Object.assign(sanitizeHtml.defaults.allowedAttributes, {
      div: (sanitizeHtml.defaults.allowedAttributes.div || []).concat(['data-language']),
    }),
  });
  const blog = parse(postHtml, {
    replace: (domNode: any) => {
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

  return {
    props: {
      doc,
    },
  };
};
