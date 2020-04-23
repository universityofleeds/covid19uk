if(is.null(curl::nslookup("r-project.org", error = FALSE))) {
  stop(message(
    "No connection",
    "To save space on the repo files need to be downloaded.",
    "Please re-run when you are connected."
  ))
}
packages <- c("sf", "geojsonsf", "curl")
if (length(setdiff(packages, rownames(installed.packages()))) > 0) {
  install.packages(setdiff(packages, rownames(installed.packages())),repos='http://cran.us.r-project.org')
}

lapply(packages, library, character.only = TRUE)
# Enable CORS -------------------------------------------------------------
#' CORS enabled for now. See docs of plumber
#' for disabling it for any endpoint we want in future
#' https://www.rplumber.io/docs/security.html#cross-origin-resource-sharing-cors
#' @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}
# TODO: option to remove above CORS

#' @section TODO:
#' The plumber endpoint should not be there. Currently mapping React build to /
#' at assets causes the swagger endpoint to be 404. Support is limited.
#'
#' @get /__swagger__/
swagger <- function(req, res){
  fname <- system.file("swagger-ui/index.html", package = "plumber") # serve the swagger page.
  plumber::include_html(fname, res)
}

#' serve covid19
#' @get /api/covid19w
get_covid19w <- function(res) {
  res$body <- covid19_world
  res
}

source("R/covid19.R")
#' serve covid19-regions
#' @get /api/covid19r
get_covid19r <- function(res) {
  res$body <- covid19_regions
  res
}

### tests
tests = read.csv("https://gist.githubusercontent.com/layik/cc4835bbafbb6159fbb1b34d9a755ae8/raw")
#' @serializer unboxedJSON
#' @get /api/covid19t
get_covid19r <- function(res) {
  tests
}

#' Allowed paths.
#' @get /world
#' @get /world/
#' @get /about
#' @get /about/
routesAllowed <- function(req, res){
  fname <- file.path("build", "index.html")
  plumber::include_html(fname, res)
}

#' Tell plumber where our public facing directory is to SERVE.
#'
#' @assets ./build /
list()
