/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import './App.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AbstractWidgetProps } from '@itwin/appui-abstract';
import {
  StagePanelLocation, StagePanelSection, StageUsage, UiItemsProvider
} from '@itwin/appui-react';
import { BrowserAuthorizationClient } from '@itwin/browser-authorization';
import { FitViewTool, IModelApp, StandardViewId } from '@itwin/core-frontend';
import { FillCentered } from '@itwin/core-react';
import { Button, ButtonGroup, ProgressLinear } from '@itwin/itwinui-react';
import { useAccessToken, Viewer, ViewerPerformance } from '@itwin/web-viewer-react';

import { history } from './history';

import type { ScreenViewport } from "@itwin/core-frontend";
const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(process.env.IMJS_IMODEL_ID);
  const [iTwinId, setITwinId] = useState(process.env.IMJS_ITWIN_ID);

  const accessToken = useAccessToken();

  const authClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        scope: process.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
        clientId: process.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
        redirectUri: process.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
        postSignoutRedirectUri: process.env.IMJS_AUTH_CLIENT_LOGOUT_URI,
        responseType: "code",
        authority: process.env.IMJS_AUTH_AUTHORITY,
      }),
    []
  );

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    if (accessToken) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("iTwinId")) {
        setITwinId(urlParams.get("iTwinId") as string);
      } else {
        if (!process.env.IMJS_ITWIN_ID) {
          throw new Error(
            "Please add a valid iTwin ID in the .env file and restart the application or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }

      if (urlParams.has("iModelId")) {
        setIModelId(urlParams.get("iModelId") as string);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && iTwinId) {
      let queryString = `?iTwinId=${iTwinId}`;
      if (iModelId) {
        queryString += `&iModelId=${iModelId}`;
      }

      history.push(queryString);
    }
  }, [accessToken, iTwinId, iModelId]);

  /** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
   * This will provide an "optimal" view of the model. However, it will override any default views that are
   * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
   * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
   */
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            ViewerPerformance.addMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded"
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={iTwinId ?? ""}
        iModelId={iModelId ?? ""}
        authClient={authClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/web-viewer-react)
        uiProviders={[
          new MyUiItemsProvider(),
        ]}
      />
    </div>
  );
};

const buttons = [
  "Button 1",
  "Button 2",
  "Button 3",
  "Button 4",
  "Button 5",
];

class MyUiItemsProvider implements UiItemsProvider {
  public id = "my-ui-provider";
  public provideWidgets(
    _stageId: string,
    stageUsage: string,
    location: StagePanelLocation,
    section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (
      location === StagePanelLocation.Right &&
      section === StagePanelSection.Start &&
      stageUsage === StageUsage.General
    ) {
      widgets.push({
        id: "my-widget-id",
        label: "My_Widget",
        getWidgetContent: () => <MyComponent />,
      });
    }

    return widgets;
  }
}

function MyComponent() {
  const [showInput, setShowInput] = React.useState(false);

  return (
    <>
      <div style={{ display: "flex", position: "relative", alignItems: "center" }}>
        <ButtonGroup
          className={showInput ? "button-group contracted" : "button-group"}
          overflowButton={() => <Button size="small" styleType="borderless">More</Button>}
        >
          {buttons.map((btn, index) => <Button key={index}>{btn}</Button>)}
        </ButtonGroup>
        <Button
          onClick={() => {
            setShowInput((prev) => !prev);
          }}
        >
          Collapse
        </Button>
      </div>
    </>
  );
}


export default App;
