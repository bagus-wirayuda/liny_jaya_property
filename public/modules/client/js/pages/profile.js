(function () {
  const { profileForm } = LJ.dashboardShared;
  LJ.pages.client.profile = function (tab) {
    return profileForm("client", tab);
  };
})();
