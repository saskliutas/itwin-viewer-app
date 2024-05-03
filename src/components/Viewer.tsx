/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { useEffect, useState } from "react";
import { history } from "../history";
import { Viewer as WebViewer } from "@itwin/web-viewer-react";
import { useAuthorizationContext } from "./Authorization";
import { TreeWidget } from "@itwin/tree-widget-react";
import { createTreeWidgetUiItemsProvider } from "./UiProviders";

const uiProviders = [createTreeWidgetUiItemsProvider()];

export function Viewer() {
  const { client: authClient } = useAuthorizationContext();
  const { iTwinId, iModelId } = useIModelInfo();

  return (
    <WebViewer
      iTwinId={iTwinId}
      iModelId={iModelId}
      authClient={authClient}
      enablePerformanceMonitors={false}
      onIModelAppInit={onIModelAppInit}
      uiProviders={uiProviders}
    />
  );
}

async function onIModelAppInit() {
  await TreeWidget.initialize();
}

function useIModelInfo() {
  const [state, setState] = useState({ iTwinId: "", iModelId: "" });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currITwinId = urlParams.get("iTwinId");
    const currIModelId = urlParams.get("iModelId");

    if (currITwinId && currIModelId) {
      setState({ iTwinId: currITwinId, iModelId: currIModelId });
      return;
    }

    if (!process.env.IMJS_ITWIN_ID || !process.env.IMJS_IMODEL_ID) {
      throw new Error(
        "Please add a valid iTwin ID and iModel ID in the .env file and restart the application or add it to the `iTwinId`/`iModelId` query parameter in the url and refresh the page. See the README for more information."
      );
    }

    const configuredITwinId = process.env.IMJS_ITWIN_ID;
    const configuredIModelId = process.env.IMJS_IMODEL_ID;
    history.push(
      `?iTwinId=${configuredITwinId}&iModelId=${configuredIModelId}`
    );
  }, []);

  return state;
}
