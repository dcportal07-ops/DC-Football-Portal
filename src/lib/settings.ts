export const ITEM_PER_PAGE = 10;

type RouteAccessMap={
    [key:string]:string[]
}

export const roleAccessMap: RouteAccessMap = {
  "/admin(.*)":["admin"], 
  "/coach(.*)":["coach"], 
  "/player(.*)":["player"],  
  "/list/coaches": ["admin", "coach"],
  "/list/players": ["admin", "coach"],
  "/list/teams": ["admin", "coach"],
  "/list/evaluations": ["admin", "coach"],
  "/list/drills": ["admin", "coach"],
  "/list/homework": ["admin", "coach", "player"],
  "/list/stats": ["admin", "coach", "player"],
  "/list/announcements": ["admin", "coach", "player"],
};
