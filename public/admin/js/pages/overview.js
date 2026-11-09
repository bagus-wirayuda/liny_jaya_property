(function () {
  const { managementOverview } = LJ.dashboardShared;
  LJ.pages.admin.overview = function (tab) {
    return managementOverview("admin");
  };
})();
