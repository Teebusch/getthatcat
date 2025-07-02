make_random_name <- function() {
    ids::adjective_animal(style = "title")
}


get_uid <- function() {
    ids::uuid(drop_hyphens = TRUE)
}


smp <- \(...) unlist(sample(list(...), 1L))