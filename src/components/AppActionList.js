import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import jwtDecode from "jwt-decode";

function AppActionList() {
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const [appActions, setAppActions] = useState({});
  const [isManager, setIsManager] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchAppActions = async () => {
      const domain = process.env.REACT_APP_AUTH0_DOMAIN;

      const token = await getAccessTokenSilently({
        audience: "Charlie Identifier",
      });

      // Decode the token to get user id
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.sub;

      const callProtectedApi = await fetch("http://localhost:3001/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(callProtectedApi);

      // Get user profile from the "Get User by ID" endpoint
      const profileRes = await axios.get(
        `https://${domain}/api/v2/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserProfile(profileRes.data);

      // Fetch user roles
      const rolesRes = await axios.get(
        `https://${domain}/api/v2/users/${user.sub}/roles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userRoles = rolesRes.data.map((role) => role.name);
      setIsManager(userRoles.includes("Manager"));

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

        await Promise.all(
          triggers.data.triggers.map(async (trigger) => {
            const bindings = await axios.get(
              `https://${domain}/api/v2/actions/triggers/${trigger.id}/bindings`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const appActions = bindings.data.bindings.filter((binding) =>
              binding.action.id.includes(app.client_id)
            );
            actionMap[app.name].push(...appActions);
          })
        );
      }
      setAppActions(actionMap);
    };

    if (user) {
      fetchAppActions();
    }
  }, [user, isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h3>User is {isAuthenticated ? "Logged in" : "Not logged in"}</h3>
      {isAuthenticated && (
        <pre style={{ textAlign: "start" }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
      {userProfile && (
        <div>
          <h2>User Profile</h2>
          <p>{JSON.stringify(userProfile, null, 2)}</p>
        </div>
      )}
      {Object.entries(appActions).map(([appName, actions]) => (
        <div key={appName}>
          <h2>{appName}</h2>
          {actions.map((action) => (
            <div key={action.id}>
              <p>Action: {action.name}</p>
              {isManager && <p>Trigger: {action.trigger_id}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AppActionList;
