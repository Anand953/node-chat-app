const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room }=Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>{
    //new message element
    const $newMesssage = $messages.lastElementChild
  
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMesssage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMesssage.offsetHeight + newMessageMargin
    //console.log(newMessageMargin)

      //visible height
      const visibleHeight = $messages.offsetHeight

      //height of messages container
      const containerHeight = $messages.scrollHeight

      //How far have i scrolled?
      const scrolloffset = $messages.scrollTop + visibleHeight

      if(containerHeight - newMessageHeight <= scrolloffset) {
       $messages.scrollTop = $messages.scrollHeight
      }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})
               
socket.emit('join', {username, room}, (error)=>{
    if(error) {
        alert(error)
        location.href='/'
    }
})

//theory:
// Andrew: In this lesson,

// you'll be integrating auto scrolling

// into the chat application.

// And to get this done,

// we're gonna start with a quick visualization

// to make sure we're all on the same page

// as to what we're working towards.

// Then we'll head into our client side JavaScript

// and actually knock this out.

// So we have our lighter rectangle

// which represents all of the content that's available.

// And then we have our sidebar

// representing what we're able to see.

// So in this case, the height for both is the same

// and we're able to see everything.

// And that's true.

// When our first message comes in we can see it.

// And same with the second, and in this example, the third.

// Now when a fourth message comes in,

// the available content gets longer

// but we're not able to see it.

// We need to scroll through the content

// to see the chat messages.

// In this case, what we're gonna have the browser do

// is automatically scroll the user to the bottom

// so they're able to view the most recent content.

// The same thing is true when the next message comes in.

// The next message comes in,

// we have more content available

// and we scroll the user to the bottom

// so they can see that latest message.

// Now this is great when the user

// is looking at the latest content,

// but what happens if I go searching through the chat history

// to see what someone said?

// So I manually scroll up to the top to see what someone said

// about when we're meeting or where we're meeting.

// And in this case, it would be really frustrating

// if every new message

// automatically brought me to the bottom,

// since I've intentionally scrolled up

// looking for something specific.

// So in this case, we are not scrolled to the bottom.

// So when a new message comes in,

// we're not going to auto scroll.

// We're only gonna auto scroll

// when the user is viewing the most recent content.

// In this case, we're not.

// So if a new message comes in, our content gets longer,

// but we're not going to scroll them

// so they can keep looking at what they're looking at.

// Now later on,

// if I was to manually scroll back to the most recent content,

// then I am scrolled to the bottom

// and we would auto scroll for new messages.

// So right here,

// I could go ahead and add a new message into the mix

// and like we've seen before,

// you would get auto scrolled to the bottom.

// So we wanna make sure

// that users can look through that chat history

// without getting constantly interrupted.

// And we also wanna make sure

// that if someone's having a conversation with someone else

// they're able to see the latest messages as they come in.

// Now that we know what we're working towards,

// let's go ahead and actually implement that into chat.js.

// Back inside of chat.js we're gonna make some changes

// to our JavaScript code.

// The first thing we wanna do is figure out

// where we want to put all of this auto scrolling logic.

// Now we wanna do this every single time

// we render a new message and we render new text messages

// right here in this callback function

// and new location messages down below.

// So instead of adding the logic into both locations

// I'll just create a function that we call in both.

// Right here a new constant called something like "autoscroll"

// is going to get the job done.

// This doesn't need any arguments

// and we're going to call it

// just after rendering our messages.

// So right here, after we render our text messages,

// I'm going to call auto scroll.

// And I'm gonna do the exact same thing

// after rendering those location messages.

// Now calling this function itself

// doesn't guarantee we're actually gonna be auto scrolled

// but it's at least going to run the logic

// and figure out if we should.

// If we should it will indeed scroll us to the bottom.

// If someone was digging through that chat history

// then we won't auto scroll them,

// which is the behavior that we want.

// The first thing we need to do

// is get that new message element.

// That's going to allow us to run the calculation.

// So remember at this point in time

// the new message has already been added.

// So it's our job to figure out

// if they were scrolled to the bottom

// without this new message being in there,

// which means we need the height of the new message element.

// So right here, I'm gonna extensively comment this function

// since it can be quite confusing.

// First up, let's go ahead and get the new message element.

// I'm gonna create a constant

// called something like "$newMessage"

// using the dollar sign syntax since we're storing an element.

// And right here, we are going to grab messages

// and we are going to use its last element child property.

// That's going to grab the last element as a child,

// which would be the new message

// since new messages are added to the bottom.

// So in this case, we have the new message element

// and the next thing we need to do,

// which is going to take a few different steps,

// is to get the height of the last message.

// Actually, let's just call that the new message,

// so we're using the same terminology.

// So we need to know how tall that message is.

// It's standard content including extra things,

// like its margin.

// So right here,

// what we're gonna do is start with the following;

// constant last.

// Actually let's call it new.

// NewMessageHeight.

// And this is going to equal the following.

// We're going to grab that new message element

// and we're going to use a property, "offsetHeight."

// Now this is a great start.

// The only problem is that

// this doesn't take into account the margin.

// Now we have to run two extra statements

// in order to get that value.

// Now, you might say the value is hard coded in our CSS,

// so can't we just hard code it here as well?

// But that could cause problems

// if we choose to change these styles in the future.

// It would be really confusing to have to change that style.

// Then later on you'd figure out auto scroll broke

// but you wouldn't know why.

// So it's best to not hard code that value.

// Instead, we're gonna look at that new message element

// and figure out what that margin bottom we set was.

// Right here I'm gonna create a variable,

// something along the lines of, "newMessageStyles."

// And to get the computed styles for a given element

// we use the global "getComputedStyle,"

// which is made available to us by the browser.

// We pass to it.

// The element in this case I'm trying to get these styles

// for the new message, so we can figure out

// what that margin bottom spacing value is.

// Now let's go ahead and dump this

// to the terminal to see exactly what we're getting.

// So that's console.log.

// NewMessageStyles.

// I'm gonna go ahead and save the chat app.

// I will refresh things over in the browser

// and open up the developer tools

// cracking open the console

// and right here we can see that the log we're looking for

// is from line 26.

// That is the log right here.

// If I crack that open, what do we get?

// We have a whole bunch of different properties.

// It starts off with a list of all of the available styles

// that were applied.

// Then we have them by name in alphabetical order.

// And if we scroll all the way down to M for margin,

// we can see that we have margin bottom

// with a value of 16 pixels.

// So in this case,

// that's exactly what we want to extract,

// though we wanna convert it to a number

// so we can actually add it on to the offset height

// right here.

// Let's go ahead and do just that.

// I'm gonna create a new constant called "newMessageMargin."

// And I'm going to start by using parseInt.

// ParseInt takes a string in and it parses it to a number.

// In this case 16 as the string will become 16 as a number.

// And we're going to pass the value in.

// That is newMessageStyles accessing marginBottom,

// as we saw before.

// Now with this in place,

// we can go ahead and see what we get for that.

// So I'm going to log out newMessageMargin to the console.

// I'm gonna save the file and refresh things from the browser.

// Right here I have the number 16, which is great.

// All we're going to do is add that on right here.

// So newMessageMargin.

// So we wrote a lot of code already.

// Let's quickly recap what we're doing.

// We grab the new message.

// We then go ahead and get the margin value.

// Then we take the margin

// and we add it on to the height of the message

// getting its total height.

// And we store that right here

// in a variable that we're currently not using.

// Next up, let's go ahead and get the visible height.

// So the visible height is something

// that's not going to change often.

// So right here as an example,

// the visible height let's just say is a hundred pixels.

// As I add new messages in, that doesn't change.

// As those messages go off the screen

// that doesn't change as well.

// The amount of space I can view stays the same

// even though the total content is a bit longer.

// So we need that value and we can get it with one line,

// const visibleHeight.

// I'm just storing things in a variable here

// to make it a little easier to work with.

// We are going to grab the messages element

// and we're going to access its offset height

// to get that value.

// Now the next thing we need is the total height

// of that container.

// So in this case, the container height

// is much larger than the visible height,

// as there are things I cannot see.

// So right here, let's go ahead and get that done.

// A new comment.

// Right here, "Height of messages container."

// We'll create a new variable for that as well.

// Something like container height or content height.

// And right here we will once again access messages.

// This time though, accessing a different property

// that is "scrollHeight."

// So this gives us the total height

// we are able to scroll through.

// Next up what we need

// is to figure out how far down we are scrolled.

// So are we up top?

// Are we down below?

// We need to figure out how far down we have actually scrolled

// in order to perform this calculation correctly.

// So right here, something like, "How far have I scrolled?"

// We're gonna store this in a variable,

// and this is actually the last variable

// we're going to create.

// I'll call it "scrollOffset."

// And we're going to start with the following.

// That is "messages.scrollTop."

// Now, what exactly does scroll top give us?

// Well, it gives us as a number,

// the amount of distance we've scrolled from the top.

// So in this case it's zero.

// The top of my scroll bar is at the top

// of the content I can scroll through.

// And if I scroll down the value gets larger.

// So in this case, maybe it's something like 30, then 60,

// and so on.

// Now what we really want

// is to know how far from the bottom we are,

// but there is no scroll bottom.

// So we're going to work around that

// by taking these scroll top.

// That is the distance between the top of the content

// and the top of the scroll bar.

// And we're going to add on the scroll bar's height,

// which is just the visible height of the container.

// That's gonna give us a more accurate picture

// of how close to the bottom we are.

// So right here we take the scroll top

// and we add on our visible height.

// Perfect.

// Now with all of this in place,

// we're actually ready to perform

// a little bit of conditional logic.

// This conditional logic is going to run some code

// and that code will scroll us to the bottom.

// Let's go ahead and talk about the condition.

// The first thing we're gonna do

// is we're going to take our container height.

// So the total container height, not just what's visible.

// And we're going to subtract the height of the last message.

// So that would be new message height.

// Now the reason we're doing this

// is because we wanna figure out

// if we were scrolled to the bottom,

// but before this message was added in.

// If we don't account for this,

// we'll never be scrolled to the bottom

// because we're running this code

// just after adding the new message

// and the user would never get a chance to scroll down.

// So in this case,

// we're just taking the new message out of the mix.

// So we're seeing if that container height

// is less than or equal to.

// And in this case it's going to be our scroll offset.

// So we wanna make sure that we were indeed at the bottom

// before the last message was added.

// Now, if we were, that's great, we're going to auto scroll.

// If not, that's fine too, we're not going to auto scroll.

// To auto scroll, all we do is we use messages.scrollTop.

// Now, we already used that to read its value

// but we can also set its value.

// And in this case we're going to set it to the scroll height.

// The total available content we can scroll.

// So right here, messages.scrollHeight.

// And this is going to push us to the bottom.

// So we're setting a new value

// for how far down we're scrolled.

// How far down? Well, all the way.

// Now with this in place,

// we should be able to test things out.

// Now it's important to note that a lot of the complexity here

// is to figure out if we were near the bottom or not,

// so we can provide the user with a nice user experience.

// If you wanted to just always scroll them to the bottom,

// this function would be just one line.

// It would be this line.

// Always scroll to the bottom.

// In this case though,

// we do wanna provide that nicer user experience,

// so it required a bit more code.

// But now that you know how to do this,

// you could perform this in all of your applications.

// Over in the browser, let's test things out.

// So right here, I'm gonna go ahead and provide some messages.

// Right here, I can see that things are working as expected.

// Now the next message is gonna get clipped

// but we can see we do scroll to the bottom.

// Then I'll add five, six, and seven.

// And I'm scrolling to the bottom for all of those.

// Now I'm gonna scroll up,

// saying maybe I wanted to look through the history

// to see what the first message was,

// but during that time someone else sends a message.

// In this this case, we can just send it ourselves.

// I will send the message "Test!."

// I send that off.

// It does get sent,

// but you can see we haven't been automatically scrolled down

// since we manually scrolled up.

// Now in the future, if I do scroll all the way down

// I am now seeing Test.

// And for new messages I would get auto scrolled

// so I can continue on with eight and then nine.

// And I'm auto scrolled as expected.

// So this behavior just gives us a little more flexibility,

// allowing us to provide a nice UI for that user.

// And it's something that's gonna work

// even as we change the height and the width of the browser.

// So right here I add another message in

// and it is still auto scrolling,

// since we recalculate all of those values

// every single time we perform that auto scrolling logic.

// Now, if you're not into the front end or the browser,

// this video might have been more frustrating than anything,

// but regardless, it is all done

// and we have auto scrolling set up.

// That's where we're gonna stop for this one.

// In the next lesson we'll be deploying our chat app

// to production.

// So let's jump right into that.