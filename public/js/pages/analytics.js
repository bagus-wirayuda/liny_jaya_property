(function () {
  const { analytics } = LJ.dashboardShared;
  LJ.pages.shared.analytics = function (tab, role) {
    const d = LJ.db,
      readonly = role === "director";
    return analytics(tab);
  };
})();
