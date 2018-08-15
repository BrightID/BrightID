## Todo

~~update the connections array so that its more accurate~~
add more documentation
refactor the app for consistenty across platforms
update stylesheets
update bottom nav
make group screens functional
change the QR code screens
add API calls
create webrtc signalling server
before generating qr code, send RTCSessionDescription to server
signalling server generates unique id for user
app generates qrcode with unique id
user2 sends a POST request to the server with the unique id and RTCSessionDescription
user 1 polls the signalling server
when each user is connected and complete, send POST request to server indicating they are ready to exchange information
split up user avatar string into chunks when sending over webrtc