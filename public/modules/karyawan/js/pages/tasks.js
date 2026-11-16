(function () {
  const { taskBoard } = LJ.dashboardShared;
  LJ.pages.employee.tasks = function (tab) {
    const d = LJ.db,
      mytasks = d.tasks.filter((t) => t.employee === LJ.employeeName());
    return taskBoard(mytasks);
  };
})();
