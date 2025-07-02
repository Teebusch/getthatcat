# rlang::check_installed("shiny (>= 1.11.0)", reason = "Es werden UI-Features aus 1.11.0 verwendet")
# rlang::check_installed(c("R6", "bslib"))

library(shiny)

devmode(TRUE)

# --- Globaler Server ------------------------------------------------------------------------------

ChatServer <- R6::R6Class(
  "ChatServer",
  public = list(
    initialize = function() {
      # ...
    },
    join = function() {
      # ...
    },
    leave = function() {
      # ...
    },
    send_message = function(message) {
      # ...
    }
  ),
  private = list(
    subscribers = list(),
    notify_subscribers = function() {
      # ...
    }
  )
)

chat <- ChatServer$new() 


# --- Client --------------------------------------------------------------------------------------

server <- function(input, output, session) {
  # Nutzer beim chat server anmelden, wenn seine Session beginnt
  chat$join() 
  # ...
  
  # Auf eingehende Nachrichten reagieren
  msg_content <- "Test, Test, 1, 2, 3...🎤"
  render_message(msg_content)
  # ...
  
  # Nutzer vom chat server abmelden, wenn seine Session endet
  session$onSessionEnded(\() { 
    chat$leave() 
  })
  
  # Den chat server darüber informieren, dass dieser Nutzer eine chat nachricht sendet
  observeEvent(
    input$inp_message,
    {
      msg_content <- req(input$inp_message)
      updateTextInput(session, "inp_message", value = "")
      chat$send_message(msg_content)
    }
  )
}


# --- UI Funktionen --------------------------------------------------------------------------------

# Hier braucht erstmal nix angepast zu werden um den Chat zum laufen zu bekommen.

ui <- bslib::page_fillable(
  title = "Shiny Chat",
  theme = bslib::bs_theme(preset = "sketchy"),
  tags$style("
    .fade-in { animation: fadeIn 0.2s ease-in; }
    @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  "),
  tags$h1("Shiny Chat"),
  div(
    id = "messages", 
    class = "d-flex flex-column-reverse align-items-start overflow-y-scroll p-3"
  ) |> 
    bslib::as_fill_item(),
  wellPanel(
    textInput(
      "inp_message", 
      label = NULL, 
      placeholder = "Nachricht (Enter zum Senden)", 
      width = "100%", 
      updateOn = "blur"
    ) |>
      htmltools::tagAppendAttributes(
        class = "mb-0"
      ) |>
      htmltools::tagAppendAttributes(
        autofocus = "", 
        autocomplete = "off", 
        .cssSelector = "input"
      )
  )
)


render_message <- function(msg_content) {
  msg <- div(class = "alert alert-info fade-in", msg_content)
  insertUI("#messages", "afterBegin", msg)
}


shinyApp(ui, server)