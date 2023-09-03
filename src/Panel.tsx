import React from 'react';
import {
  useAddonState,
  useChannel,
  useStorybookApi,
} from '@storybook/manager-api';
import { SNIPPET_RENDERED } from '@storybook/docs-tools';
import { ADDON_ID } from "./constants";
import { SyntaxHighlighter, SyntaxHighlighterProps } from "@storybook/components";
import { styled } from "@storybook/theming";

interface PanelProps {
  active: boolean;
  key: string;
}

const StyledSyntaxHighlighter: React.FunctionComponent<SyntaxHighlighterProps> = styled(
  SyntaxHighlighter
)(({ theme }) => ({
  // DocBlocks-specific styling and overrides
  fontSize: `${theme.typography.size.s2 - 1}px`,
  lineHeight: '19px',
  borderRadius: theme.appBorderRadius,
  boxShadow:
    theme.base === 'light' ? 'rgba(0, 0, 0, 0.10) 0 1px 3px 0' : 'rgba(0, 0, 0, 0.20) 0 2px 5px 0',
  'pre.prismjs': {
    padding: 20,
    background: 'inherit',
  },
}));

export const Panel: React.FC<PanelProps> = (props) => {
  const api = useStorybookApi();
  const story = api.getCurrentStoryData();

  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [{ code }, setState] = useAddonState(ADDON_ID, {
    code: null,
  });

  useChannel({
    [SNIPPET_RENDERED]: (data) => {
      console.log("data", data);
      const code = data.source ?? null;
      setState((state) => ({ ...state, code }));
    }
  });

  const format = false;
  const language = 'jsx';

  return props.active && !!story && !!code ? (
    <StyledSyntaxHighlighter
      key={props.key}
      copyable
      format={format}
      language={language}
    >
      { code }
    </StyledSyntaxHighlighter>
  ) : null;
};
