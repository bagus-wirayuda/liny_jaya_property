(function () {
  const { analytics } = LJ.dashboardShared;
  LJ.pages.admin.analytics = function (tab) {
    return LJ.pages.shared.analytics(tab, "admin");
  };
})();
