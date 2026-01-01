// styles.js - Centralized styles for session drawer components
export const createStyles = (theme, insets, screenWidth) => ({
  // OVERLAY & POSITIONING
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  // DRAWER CONTAINERS
  drawer: {
    position: 'absolute',
    left: 0,
    top: insets.top,
    bottom: 0,
    width: screenWidth * 0.8,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  persistentDrawer: {
    width: 320,
    elevation: 5,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // HEADER & NAVIGATION
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginTop: 0,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 36,
  },
  sectionHeaderNoMargin: {
    marginBottom: 0,
  },
  sectionHeaderLeft: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  // BUTTONS & CONTROLS
  closeButton: {
    padding: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createIcon: {
    marginRight: 4,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  inlineNewSessionButton: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineNewSessionText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // SESSION ITEMS
  sessionItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sessionTouchable: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSessionItem: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  activeSessionTitle: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  childSessionItem: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionHeader: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionCount: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  sessionSummary: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 1,
    marginBottom: 1,
  },
  summaryAdditions: {
    color: theme.colors.success,
  },
  summaryDeletions: {
    color: theme.colors.error,
  },
  sessionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  childIndicator: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  sessionTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  sessionTitleRow: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  newSessionTitle: {
    color: theme.colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  busySessionTitle: {
    fontWeight: 'bold',
  },
  inlineSummary: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  titleContainer: {
    flex: 1,
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTime: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  activeIndicator: {
    marginLeft: 8,
  },

  // PROJECT ITEMS
  projectSelector: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginRight: 8,
  },
  projectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  expandedProjectItem: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  projectItemExpanded: {
    backgroundColor: theme.colors.surface,
  },
  projectText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  projectPath: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  projectExpanded: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  // SCROLLVIEW & CONTAINERS
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },

  // MODAL & DROPDOWN
  dropdownOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: insets.top + 100,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 5,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // LOADING & SKELETON
  skeletonItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  skeletonText: {
    height: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 4,
    marginBottom: 8,
  },

  // ICONS & VISUAL ELEMENTS
  icon: {
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: theme.colors.statusConnected,
  },
  statusDotConnecting: {
    backgroundColor: theme.colors.statusConnecting,
  },
  statusDotError: {
    backgroundColor: theme.colors.statusUnreachable,
  },
});