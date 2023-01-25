import { UIView } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { SpinnakerHeader } from '../header/SpinnakerHeader';
import { CustomBanner } from '../header/customBanner/CustomBanner';
import { UrlParser } from '../navigation/urlParser';
import { SpinErrorBoundary } from '../presentation/SpinErrorBoundary';
import { Notifier } from '../widgets/notifier/Notifier';
import { Spinner } from '../widgets/spinners/Spinner';

export interface ISpinnakerContainerProps {
  authenticating: boolean;
  routing: boolean;
}

export const SpinnakerContainer = ({ authenticating, routing }: ISpinnakerContainerProps) => {
  const [, queryString] = window.location.href.split('?');
  const queryParams = UrlParser.parseQueryString(queryString);

  return (
    <SpinErrorBoundary category="SpinnakerContainer">
      <RecoilRoot>
        <div className="spinnaker-container grid-container">
          {!authenticating && routing && (
            <div className="transition-overlay">
              <Spinner size="medium" />
            </div>
          )}
          <CustomBanner />
          {!queryParams['fromISD'] && (
            <div className="navbar-inverse grid-header">
              <UIRouterContextComponent>
                <SpinnakerHeader />
              </UIRouterContextComponent>
            </div>
          )}

          <div className="spinnaker-content grid-contents">{!authenticating && <UIView name="main" />}</div>
        </div>
        <Notifier />
      </RecoilRoot>
    </SpinErrorBoundary>
  );
};
