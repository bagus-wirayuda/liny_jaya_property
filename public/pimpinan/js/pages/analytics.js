(function () {
  const { analytics } = LJ.dashboardShared;
  LJ.pages.director.analytics = function (tab) {
    return LJ.pages.shared.analytics(tab, "director");
  };
})();
