import React, { useState, useEffect } from "react";
import axios from "axios";

function AppActionList() {
  const [appActions, setAppActions] = useState({});

  useEffect(() => {
    const fetchAppActions = async () => {
      const domain = process.env.REACT_APP_AUTH0_DOMAIN;
      const token = process.env.REACT_APP_TOKEN;

      // Fetch all applications
      const apps = await axios.get(`https://${domain}/api/v2/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let actionMap = {};

      for (const app of apps.data) {
        actionMap[app.name] = [];

        // Retrieve all actions for each trigger
        const triggers = await axios.get(
          `https://${domain}/api/v2/actions/triggers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (Array.isArray(triggers.data)) {
          await Promise.all(
            triggers.data.map(async (trigger) => {
              const bindings = await axios.get(
                `https://${domain}/api/v2/actions/triggers/${trigger.id}/bindings`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              const appActions = bindings.data.bindings.filter((binding) =>
                binding.action.code.includes(app.client_id)
              );
              actionMap[app.name].push(...appActions);
            })
          );
        }
      }

      // Set the state outside the for loop
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
