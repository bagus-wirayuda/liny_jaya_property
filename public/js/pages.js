(function () {
  const { page, role, menu, resource } = document.body.dataset;
  const params = new URLSearchParams(location.search);
  const workspace = ["projects", "units"].includes(resource)
    ? Object.keys(LJ.roles).find(
        (key) => LJ.roles[key].folder === params.get("workspace"),
      )
    : undefined;

  LJ.rolePage = (role, menu = "overview") =>
    LJ.roles[role].folder + "/" + (menu === "overview" ? "index" : menu) + ".html";
  LJ.propertyPage = (resource, id, role) => {
    const query = new URLSearchParams({ id });
    if (LJ.roles[role]) query.set("workspace", LJ.roles[role].folder);
    return (resource === "projects" ? "proyek.html" : "unit.html") + "?" + query;
  };

  LJ.pages = {
    public: {},
    admin: {},
    client: {},
    employee: {},
    director: {},
    shared: {},
  };
  LJ.currentPage = {
    page: workspace ? "property-detail" : page,
    file: location.pathname.split("/").pop() || "index.html",
    role: workspace || role,
    menu:
      menu ||
      (workspace === "client"
        ? "search"
        : workspace === "admin" && resource === "units"
          ? "units"
          : "projects"),
    resource,
    id: resource ? params.get("id") || LJ.db[resource][0]?.id : undefined,
    params,
  };
})();
