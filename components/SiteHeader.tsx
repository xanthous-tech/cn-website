import React, { FC } from 'react';
import { Header, Image } from 'grommet';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from '../assets/logo.svg';

const SiteHeader: FC = () => (
  <Header pad="medium" responsive>
    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
    <Image src={logo} height="50px" />
    {/* <Link href="/blog"><Anchor>博客</Anchor></Link> */}
  </Header>
);

export default SiteHeader;
