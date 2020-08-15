import React, { FC } from 'react';
import { Text, Anchor, Footer } from 'grommet';

const SiteFooter: FC = () => (
  <Footer pad="medium" responsive direction="row-responsive">
    <Text color="dark-6">Copyright (c) 2020 广州先思科技有限公司</Text>
    <Anchor href="http://beian.miit.gov.cn/" target="_blank">
      粤ICP备20039499号-1
    </Anchor>
  </Footer>
);

export default SiteFooter;
