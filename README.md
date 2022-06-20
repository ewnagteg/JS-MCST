## About
The main purpose behind this is to allow me to test the AlphaCheckers AI. With the MCST data I should be able to validate whether AlphaCheckers output makes sense. One idea I have to do this is see if AlphaCheckers policy converges to the MCST output. In theory if it does that means the code is correct, if not then it'll allow me to pinpoint the problem more easily. I also created this just to have fun testing out the AI. For example, I've been testing the Alpha-Beta against the MCST algorithim. MCST appears slightly betterm, but this is also likely due to my very crude evaluation function. I want to get some data from the MCST and see if I can use it in some way to make a better function.
## Running
You can start the server with 

```
npm run start
```

You can run the generating data command with
```
npm run runai
```


## Todo
- Work on generating data command for testing AlphaCheckers
- Collect some data