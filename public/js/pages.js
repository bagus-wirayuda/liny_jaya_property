(function () {
  const { page, role, menu, resource, pageKey, recordId } = document.body.dataset;
  const params = new URLSearchParams(location.search);
  const workspace = ["projects", "units"].includes(resource)
    ? Object.keys(LJ.roles).find(
        (key) => LJ.roles[key].folder === params.get("workspace"),
      )
    : undefined;

  LJ.rolePage = (roleName, menuName = "overview") =>
    LJ.roles[roleName].folder + (menuName === "overview" ? "" : "/" + menuName);

  LJ.propertyPage = (res, id, roleName) => {
    const base = res === "projects" ? "proyek" : "unit";
    if (LJ.roles[roleName]) {
      const query = new URLSearchParams({ id, workspace: LJ.roles[roleName].folder });
      return `${base}?${query}`;
    }
    return `${base}/${encodeURIComponent(id)}`;
  };

  LJ.pages = {
    public: {},
    admin: {},
    client: {},
    employee: {},
    director: {},
    shared: {},
  };

  const resolvedKey =
    pageKey ||
    LJ.bootstrap?.pageKey ||
    (location.pathname.replace(/^\//, "") || "home").replace(/\.html$/, "");

  LJ.currentPage = {
    page: workspace ? "property-detail" : page,
    file: resolvedKey,
    pageKey: resolvedKey,
    role: workspace || role,
    menu:
      menu ||
      (workspace === "client"
        ? "search"
        : workspace === "admin" && resource === "units"
          ? "units"
          : "projects"),
    resource,
    id: resource
      ? recordId || LJ.bootstrap?.recordId || params.get("id") || LJ.db[resource][0]?.id
      : undefined,
    params,
  };
})();
