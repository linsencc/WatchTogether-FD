import React, { useEffect, useState } from 'react';
import getProfile from './api';
import { Card, Popover, Avatar } from '@douyinfe/semi-ui';
import "./content.css";
const Content = () => {
  useEffect(() => {
    const fecthData = async () => {
      const user = await getProfile();
      console.log('user', user);
    };
    let x = "1d ssdd";
    let v = 123;
    console.log('x', x);
    fecthData();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement(Card, {
    shadows: "always",
    style: {
      maxWidth: 200
    }
  }, "Semi Design \u662F\u7531\u4E92\u5A31\u793E\u533A\u524D\u7AEF\u56E2\u961F\u4E0E UED \u56E2\u961F\u5171\u540C\u8BBE\u8BA1\u5F00\u53D1\u5E76\u7EF4\u62A4\u7684\u8BBE\u8BA1\u7CFB\u7EDF\u3002"));
};
export default Content;