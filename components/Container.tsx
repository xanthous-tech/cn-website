import React, { FC, PropsWithChildren } from 'react';

import { Grommet, base, ThemeType } from 'grommet';
import { deepMerge } from 'grommet/utils';

const Container: FC = ({ children }: PropsWithChildren<any>) => (
  <Grommet
    theme={
      deepMerge(base, {
        global: {
          colors: {
            brand: '#17a5ff',
          },
          font: {
            family:
              '"Helvetica Neue", Arial, "Hiragino Sans GB","Hiragino Sans GB W3", "Microsoft YaHei", "Wenquanyi Micro Hei", "Hiragino Sans", sans-serif',
          },
        },
      }) as ThemeType
    }
  >
    {children}
  </Grommet>
);

export default Container;
