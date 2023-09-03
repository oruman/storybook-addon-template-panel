import React, {useEffect} from 'react';
import {
  useAddonState,
  useStorybookApi,
} from '@storybook/manager-api';
import { SNIPPET_RENDERED } from '@storybook/docs-tools';
import { ADDON_ID } from "./constants";
import {SyntaxHighlighter, SyntaxHighlighterFormatTypes, SyntaxHighlighterProps} from "@storybook/components";
import { styled } from "@storybook/theming";
import { SourceItem } from "@storybook/blocks";
import { Args, StoryId } from "@storybook/types";

interface PanelProps {
  active: boolean;
  key: string;
}

type StorySources = Record<StoryId, SourceItem>


type SnippetRenderedEvent = {
  id: StoryId;
  source: string;
  args?: Args;
  format?: SyntaxHighlighterFormatTypes;
};


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

const Panel: React.FC = () => {
  const api = useStorybookApi();
  const story = api.getCurrentStoryData();

  const [sources] = useAddonState<StorySources>(ADDON_ID, {});

  const id = story?.id ?? "";
  const language = 'jsx';
  const source = sources[id];
  const format = source?.format ?? false;

  return source ? (
    <StyledSyntaxHighlighter
      copyable
      format={format}
      language={language}
    >
      { source.code }
    </StyledSyntaxHighlighter>
  ) : null;
}

export const WrapperPanel: React.FC<PanelProps> = (props) => {
  const api = useStorybookApi();
  const channel = api.getChannel();

  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [sources, setState] = useAddonState<StorySources>(ADDON_ID, {});

  useEffect(() => {
    const handleSnippetRendered = (
      idOrEvent: StoryId | SnippetRenderedEvent,
      inputSource: string = null,
      inputFormat: SyntaxHighlighterFormatTypes = false
    ) => {
      const {
        id,
        args = undefined,
        source,
        format,
      } = typeof idOrEvent === 'string'
        ? {
          id: idOrEvent,
          source: inputSource,
          format: inputFormat,
        }
        : idOrEvent;

      console.log("data", idOrEvent);

      setState((current) => {
        return {
          ...current,
          [id]: { code: source, format },
        }
      });
    };

    channel.on(SNIPPET_RENDERED, handleSnippetRendered);

    return () => channel.off(SNIPPET_RENDERED, handleSnippetRendered);
  });

  return props.active ? (
    <Panel key={props.key} />
  ) : null;
};
