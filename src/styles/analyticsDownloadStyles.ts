// Download filter UI styles
export const downloadHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px 8px',
};

export const downloadChipsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  padding: '8px 12px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

export const downloadChipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  paddingLeft: 12,
  paddingRight: 4,
  paddingTop: 6,
  paddingBottom: 6,
  background: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: 20,
  whiteSpace: 'nowrap',
  fontSize: 13,
  fontWeight: 600,
  color: '#1e40af',
};

export const downloadChipLabelStyle: React.CSSProperties = {
  maxWidth: '280px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const downloadChipCloseIconStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  cursor: 'pointer',
  color: '#3b82f6',
  flexShrink: 0,
};

export const downloadBottomSheetContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

export const downloadBottomSheetHeaderStyle: React.CSSProperties = {
  padding: '16px 16px 12px',
  borderBottom: '1px solid #e2e8f0',
};

export const downloadBottomSheetBodyStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px 6px',
};

export const downloadFilterItemStyle: React.CSSProperties = {
  marginBottom: 12,
  '--background': '#f8fafc',
  '--border-color': '#e2e8f0',
  borderRadius: '10px',
} as React.CSSProperties;

export const downloadBottomSheetActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 16,
  borderTop: '1px solid #e2e8f0',
  background: '#fff',
};
