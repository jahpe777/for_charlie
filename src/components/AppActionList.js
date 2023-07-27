import React, { useState, useEffect } from "react";
import axios from "axios";

function AppActionList() {
  const [appActions, setAppActions] = useState({});

  useEffect(() => {
    const fetchAppActions = async (providerConfig) => {
      // Fetch all applications
      const apps = await axios.get(
        `https://${providerConfig.domain}/api/v2/clients`,
        {
          headers: { Authorization: `Bearer ${providerConfig.client_id}` },
        }
      );

      // Fetch all actions
      const actions = await axios.get(
        `https://${providerConfig.domain}/api/v2/actions`,
        {
          headers: { Authorization: `Bearer ${providerConfig.client_id}` },
        }
      );

      const actionMap = {};

      /* eslint-disable */
      console.log(providerConfig);

      // Map actions to applications
      apps.data.forEach((app) => {
        actionMap[app.name] = actions.data.actions.filter((action) =>
          action.code.includes(app.client_id)
        );
      });

      setAppActions(actionMap);
    };

    fetchAppActions();
  }, []);

  return (
    <div>
      {Object.entries(appActions).map(([appName, actions]) => (
        <div key={appName}>
          <h2>{appName}</h2>
          {actions.map((action) => (
            <p key={action.id}>
              Action: {action.name}, Trigger: {action.trigger_id}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AppActionList;
