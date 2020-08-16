import React, { FC } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import moment from 'moment-timezone';
import styled from 'styled-components';
import { Anchor, Box, Heading, Text } from 'grommet';

import Container from '../components/Container';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

import { YuqueApi, Repo, Doc } from '../utils/yuque-api';

interface BlogPageProps {
  repo: Repo;
  docs: Doc[];
}

const BlogListContainer = styled(Box)`
  ul {
    list-style-type: none;
  }

  a:hover {
    text-decoration: none;
  }

  time {
    margin-left: 10px;
    font-weight: normal;
  }

  time:hover {
    text-decoration: none;
  }
`;

const BlogPage: FC<BlogPageProps> = ({ repo, docs }: BlogPageProps) => (
  <>
    <Head>
      <title>{repo.name}</title>
    </Head>
    <Container>
      <SiteHeader />
      <BlogListContainer pad="large">
        <Heading level="2" color="dark-1">
          {repo.name}
        </Heading>
        <ul id="posts">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/posts/${doc.slug}`}>
                <Anchor>
                  {doc.title}
                  <Text color="dark-6" size="small">
                    <time>{moment(doc.created_at).tz(moment.tz.guess()).format('LL')}</time>
                  </Text>
                </Anchor>
              </Link>
            </li>
          ))}
        </ul>
      </BlogListContainer>
      <SiteFooter />
    </Container>
  </>
);

export default BlogPage;

export const getStaticProps: GetStaticProps = async (): Promise<{ props: BlogPageProps }> => {
  const api = new YuqueApi(process.env.yuqueToken);

  const { data: currentUser } = await api.getUser();
  const { data: repos } = await api.getRepos(currentUser.login);
  const [blogRepo] = repos.filter((repo) => repo.slug === 'x-tech-blog');
  const { data: docs } = await api.getDocs(blogRepo.namespace);

  return {
    props: {
      repo: blogRepo,
      docs: docs.filter((doc) => doc.status === 1),
    },
  };
};
