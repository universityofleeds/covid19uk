# get LAs
folder = "data"
if(!dir.exists(folder)) {
  dir.create(folder)
}
########### world ###########
# url changed 
# https://www.ecdc.europa.eu/en/publications-data/download-todays-data-geographic-distribution-covid-19-cases-worldwide
url = "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv"
worldRds = "world.Rds"
if(!file.exists(file.path(folder, worldRds))) {
  csv = read.csv(url, stringsAsFactors = FALSE)
  saveRDS(csv, file.path(folder, worldRds))
}
csv = readRDS(file.path(folder, worldRds))
c = read.csv("countries.csv")
library(sf)
c = st_as_sf(c, coords = c("longitude","latitude"))
csv$countriesAndTerritories = gsub("[^A-Za-z]", "", 
                                   csv$countriesAndTerritories)
# underscores were removed.
csv$countriesAndTerritories = gsub("([a-z])([A-Z])", "\\1 \\2", 
                                   csv$countriesAndTerritories)
csv$countriesAndTerritories = gsub("United Statesof America", 
                                   "United States",
                                   csv$countriesAndTerritories)
csv = csv[tolower(csv$countriesAndTerritories) %in% 
            tolower(c$name), ]
m = unlist(lapply(tolower(csv$countriesAndTerritories), 
                  function(x) grep(x, tolower(c$name))[1]))
sfc = st_geometry(c)
m = m[!is.na(m)]
stopifnot(!any(is.na(m)))
sfc = sfc[m]
csv = st_as_sf(csv, geom = sfc)
covid19_world = geojsonsf::sf_geojson(csv)