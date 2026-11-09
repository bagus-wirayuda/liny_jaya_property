(function () {
  const { managementOverview } = LJ.dashboardShared;
  LJ.pages.director.overview = function (tab) {
    return managementOverview("director");
  };
})();
