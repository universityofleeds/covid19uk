folder = "data"

casesRds = "cases.Rds"
url = "https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data"
csv = read.csv(url)
saveRDS(csv, file.path(folder, casesRds))

url = "https://www.arcgis.com/sharing/rest/content/items/e5fd11150d274bebaaf8fe2a7a2bda11/data"
daily = "daily.xlsx"
download.file(url, extra = '-L',
              destfile = file.path(folder, daily))

url = "https://opendata.ecdc.europa.eu/covid19/casedistribution/csv"
worldRds = "world.Rds"
csv = read.csv(url, stringsAsFactors = FALSE)
saveRDS(csv, file.path(folder, worldRds))

url = "https://fingertips.phe.org.uk/documents/Historic%20COVID-19%20Dashboard%20Data.xlsx"
las_historical = "historyLAs.xlsx"
download.file(url, extra = '-L',
              destfile = file.path(folder, las_historical))
