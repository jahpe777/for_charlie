import React, { Fragment } from "react";

import AppActionList from "../components/AppActionList";
import Content from "../components/Content";

const Home = () => (
  <Fragment>
    <AppActionList />
    <hr />
    <Content />
  </Fragment>
);

export default Home;
