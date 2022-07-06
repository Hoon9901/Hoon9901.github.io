import * as React from 'react';
import { DiscussionEmbed } from 'disqus-react';
import config from '../../../_config';
import { Helmet } from 'react-helmet';
import { Label, useColorMode } from 'theme-ui';
import Layout from '../Layout';
import Utterances from './utterances';
import { useState } from 'react';

interface CommentProps {
  slug: string;
  title: string;
}

const Comment = () => {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = React.useMemo(() => colorMode === 'dark', [colorMode]);
  console.log("댓글 " + isDark);
  
  return <Utterances repo="Hoon9901/Hoon9901.github.io" theme={isDark ? 'github-dark' : 'github-light'} />;
};

export default Comment;
