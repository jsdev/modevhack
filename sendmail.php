<?php

error_reporting(E_ALL);
ini_set('display_errors', True);

$emailTo = $_POST["emailTo"];
$emailFrom = $_POST["emailFrom"];

require_once 'unirest-php/lib/Unirest.php';
include 'sendgrid-php/lib/SendGrid.php';
SendGrid::register_autoloader();
$sendgrid = new SendGrid('treyeckels', '1iamneat2');


$mail = new SendGrid\EMail();
$mail->
  addTo($emailTo)->
  setFrom($emailFrom)->
  setSubject('Wheel of Headlines: Need a help line')->
  setText('Hello World!')->
  setHtml('<strong>Hello World!</strong>');



$sendgrid->web->send($mail);
