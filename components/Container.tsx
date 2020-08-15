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
            family: 'Hiragino Sans',
          },
        },
      }) as ThemeType
    }
  >
    {children}
  </Grommet>
);

export default Container;
