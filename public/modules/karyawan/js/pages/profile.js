(function () {
  const { profileForm } = LJ.dashboardShared;
  LJ.pages.employee.profile = function (tab) {
    return profileForm("employee", tab);
  };
})();
