import {ComponentProps} from 'react';
import styled from '@emotion/styled';

import PanelAlert from 'sentry/components/panels/panelAlert';
import WidgetCard from 'sentry/views/dashboards/widgetCard';

import {DashboardFilters, Widget} from './types';

const TABLE_ITEM_LIMIT = 20;

type Props = {
  index: string;
  isEditingDashboard: boolean;
  isEditingWidget: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onUpdate: (widget: Widget | null) => void;
  widget: Widget;
  widgetLimitReached: boolean;
  dashboardFilters?: DashboardFilters;
  isMobile?: boolean;
  isPreview?: boolean;
  windowWidth?: number;
};

function SortableWidget(props: Props) {
  const {
    widget,
    isEditingDashboard,
    isEditingWidget,
    widgetLimitReached,
    onDelete,
    onEdit,
    onUpdate,
    onDuplicate,
    isPreview,
    isMobile,
    windowWidth,
    index,
    dashboardFilters,
  } = props;

  const widgetProps: ComponentProps<typeof WidgetCard> = {
    widget,
    isEditingDashboard,
    isEditingWidget,
    widgetLimitReached,
    onDelete,
    onEdit,
    onDuplicate,
    onUpdate,
    showContextMenu: true,
    isPreview,
    index,
    dashboardFilters,
    renderErrorMessage: errorMessage => {
      return (
        typeof errorMessage === 'string' && (
          <PanelAlert type="error">{errorMessage}</PanelAlert>
        )
      );
    },
    isMobile,
    windowWidth,
    tableItemLimit: TABLE_ITEM_LIMIT,
  };

  return (
    <GridWidgetWrapper>
      <WidgetCard {...widgetProps} />
    </GridWidgetWrapper>
  );
}

export default SortableWidget;

const GridWidgetWrapper = styled('div')`
  height: 100%;
`;
