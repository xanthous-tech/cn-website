import React, { FC } from 'react';
import Head from 'next/head';
import { Box, Heading, Image, Main, Paragraph } from 'grommet';

import Container from '../components/Container';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const HomePage: FC = () => (
  <>
    <Head>
      <title>先思科技</title>
    </Head>
    <Container>
      <Main>
        <SiteHeader />
        <Box pad="large" direction="row-responsive" alignContent="between" gap="small">
          <Box>
            <Heading color="dark-1">我们专注于智能客服</Heading>
            <Paragraph color="dark-1" fill>
              我们提供根据业务场景，为企业量身定制基于微信的智能客服，支持公众号、小程序客服，和企业微信客服的服务。
            </Paragraph>
          </Box>
          <Box>
            <Image fill width={300} src="/personal-qr.png" alt="扫码体验" />
          </Box>
        </Box>
        <SiteFooter />
      </Main>
    </Container>
  </>
);

export default HomePage;
