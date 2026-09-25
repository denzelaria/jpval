import React, { useState, useEffect } from 'react'
import { Button, Container, Row, Col, Form } from 'react-bootstrap'
import { GoogleGenAI } from "@google/genai"
import LoadingComponent from '../components/LoadingComponent'

function HomeScreen() {
  const [ai, setAi] = useState(null)
  const [formality, setFormality] = useState("none")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [score, setScore] = useState("20")
  const [working, setWorking] = useState(false)
  const [problems, setProblems] = useState("")
  const [alternate, setAlternate] = useState("")
  const [color, setColor] = useState("black")
  const [level, setLevel] = useState(null)

  const submitHandler = async (e) => {
    try {
        e.preventDefault()
        if (text.length === 0) {
            alert("Please enter something")
        }else {
            setError("")
            setDone(false)
            setWorking(true)
            setScore("")
            setProblems("")
            setAlternate("")
            setLevel("")
            // var addition = ""
            // if (type === 2 && toTran) {
            //     addition = " Original sentence which the user was supposed to translate into japanese based on:"+toTran
            // }else {
            //     addition = ""
            // }
            const data = await ai.models.generateContent({
                model:"gemini-2.5-flash",
                contents:"Text to analyze:"+ text + "Formality:"+ formality,
                config:{ 
                    temperature:0.2,
                    maxOutputTokens:4000,
                    candidateCount: 1,
                    systemInstruction: {
                        parts: [{ 
                            text: `
                            You are a language prompt criticizer based on how fluent and accurate their language is.
                            You will be given a prompt and formality, which can be none(so how fluent in general it is), formal, or casual. 
                            Mark scheme:
                            grammar:40%, 
                            vocabulary:30%, 
                            naturalness(formality and informality will go in this category):30%. 
                            if the sentence they gave, is not japanese then give it a 0. youre goal is to analyze japanese sentences, and respond in english. if the given japanese sentence does not form a complete, logical sentence and does not fit any context, give it a 0-10%, for example if its a single word with no context like an exclamation mark or question mark.
                            for reference: 0%:not even japanese, 1-10% not understandable at all, 10-20% extremely flawed in vocab/grammar(loss of meaning), 20-40% flawed in vocab/grammar but barely understandable or very unfitting of formality, 40-60% a bit of flaws but overall understandable unfitting of formality, 60-80% very understandable, only flawed because of unnaturalness or slight unfitting of formality. 80-99% near-native, not perfect due to very small flaws or unrealistic textbook tone unless formal. 100% perfect.
                            Use mainly genuine calculation based off mark schemes but just use reference above to double check if fitting
                            Respond in EXACTLY this format:
                            score/100@problems but talk about only issues, be specific@alternate, improved Japanese version
                            Write maximum of 120 words MAKE SURE TO MAKE RESPONSE EXTREMELY SHORT and make sure to put @ between the score, problems and alternate(no spaces) so i can split them. Please make sure that you speak in english.
                            `}]
                    }
                }
            })
            const resparr = data.text.split("@")
            setScore(resparr[0].split("/")[0])
            setProblems(resparr[1])
            setAlternate(resparr[2])
            if (Number(resparr[0].split("/")[0]) >= 90) {
                setColor("#47F244")
                setLevel("Perfect")
            }else if (Number(resparr[0].split("/")[0]) >= 80 && Number(resparr[0].split("/")[0]) < 90) {
                setColor("#95f244ff")
                setLevel("Near-native")
            }else if (Number(resparr[0].split("/")[0]) >= 70 && Number(resparr[0].split("/")[0]) < 80) {
                setColor("#b8f244ff")
                setLevel("Easy to understand, slightly unnatural")
            }else if (Number(resparr[0].split("/")[0]) >= 60 && Number(resparr[0].split("/")[0]) < 70) {
                setColor("#ecf244ff")
                setLevel("Easy to understand, slightly unnatural")
            }else if (Number(resparr[0].split("/")[0]) >= 50 && Number(resparr[0].split("/")[0]) < 60) {
                setColor("#f2db44ff")
                setLevel("Comprehensible")
            }else if (Number(resparr[0].split("/")[0]) >= 40 && Number(resparr[0].split("/")[0]) < 50) {
                setColor("#F2B844")
                setLevel("Comprehensible")
            }else if (Number(resparr[0].split("/")[0]) >= 30 && Number(resparr[0].split("/")[0]) < 40) {
                setColor("#F29544")
                setLevel("Barely comprehensible")
            }else if (Number(resparr[0].split("/")[0]) >= 20 && Number(resparr[0].split("/")[0]) < 30) {
                setColor("#F26D44")
                setLevel("Barely comprehensible")
            }else if (Number(resparr[0].split("/")[0]) >= 10 && Number(resparr[0].split("/")[0]) < 20) {
                setColor("#F25544")
                setLevel("Extremely flawed and no clear meaning")
            }else if (Number(resparr[0].split("/")[0]) > 0 && Number(resparr[0].split("/")[0]) < 10) {
                setColor("#F24444")
                setLevel("Not comprehensible")
            }else {
                setColor("#F24444")
                setLevel("Garbage or not japanese")
            }
            
          }
          
          setDone(true)
          setWorking(false)
    }catch(error) {
      alert(error)
      setDone(false)
      setWorking(false)
      setError("Error occured. AI may be experiencing too much requests or is temporarily shut down. Please try again later (should work after a few seconds to a minute)")
    }
  }

  useEffect(() => {
    if (!ai && process.env.REACT_APP_GEMINI_API_KEY) {
        const initai = new GoogleGenAI({
            apiKey : process.env.REACT_APP_GEMINI_API_KEY || ''
        });
        setAi(initai)
    }
  })

  return (
    <div className="" style={{width:"75vw"}}>
      <Container fluid className="w-100 justify-content-center text-center p-5">
        <Row>
          <Col>
            <h1 className="text-dark fw-bolder mb-3">Fluency evaluator</h1>
            <p className="text-muted jakarta">Do your words make any sense? Better yet, how do they sound to a local?</p>
          </Col>
        </Row>
      </Container>
      <div className="w-100">
        <Container fluid className="w-100 justify-content-center text-center p-4 bg-pure-white rounded shadow-sm">
          <Form onSubmit={(e) => submitHandler(e)}>
            <Row>
              <Col className="text-start">
                <Form.Group>
                  <Form.Label className="text-dark fw-medium jakarta">Input text</Form.Label>
                  <Form.Control className="bg-grey border-0" as="textarea" rows={5} value={text} onChange={(e) => setText(e.target.value)}></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col className="justify-content-between d-flex flex-column flex-md-row">
                <Form.Group className="mb-3 mb-md-0 d-inline-flex justify-content-center flex-column flex-sm-row align-items-center gap-3 w-auto">
                  <Form.Label className="text-muted fw-medium jakarta m-0">Formality:</Form.Label>
                  <Form.Check className="jakarta" name="formality" id="radio1" type={"radio"} label="None" checked={formality === 'none'} onChange={() => setFormality("none")}></Form.Check>
                  <Form.Check className="jakarta" name="formality" id="radio2" type={"radio"} label="Casual" checked={formality === 'casual'} onChange={() => setFormality("casual")}></Form.Check>
                  <Form.Check className="jakarta" name="formality" id="radio3" type={"radio"} label="Formal" checked={formality === 'formal'} onChange={() => setFormality("formal")}></Form.Check>
                </Form.Group>
                <Button className="jakarta btns d-inline-block w-auto bg-secondary border-0 rounded px-4 py-2" type="submit">Submit</Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
      { working &&
        <Container fluid className="d-flex justify-content-center align-items-center w-100 m-0 mt-4 p-0　rounded bg-pure-white p-4 shadow-sm">
          <LoadingComponent textput="Generating.."></LoadingComponent>
        </Container>
      }
      { done && score &&
        <div fluid className="w-100 fade-in m-0 p-0">
          <Container fluid className="w-100 m-0 mt-4 p-0 text-center">
            <Row fluid className="d-flex gap-4 m-0 p-0">
              <Col className="m-0 p-0">
                <Container className="d-flex flex-column justify-content-center align-items-center text-center p-4 bg-pure-white rounded shadow-sm">
                  {
                    score && 
                    <div className="d-flex justify-content-center align-items-center">
                      <h1 className="fw-bold position-absolute" style={{color:color,fontSize:"50px"}}>{score}%</h1>
                      <style>
                        {`
                          @keyframes anim-${score} {
                            100% {
                              stroke-dashoffset: ${450 - (Number(score) / 100) * 450};
                            }
                          }
                          .circle-svg-${score} {
                            position: absolute;
                            stroke-dasharray: 450;
                            stroke-dashoffset: 450;
                            animation: anim-${score} ${0.5 + (Number(score)/100)}s ease-out forwards;
                            transform: rotate(-90deg);
                          }
                        `}
                      </style>
                      <svg className="border-0 second-circle-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="160px" height="160px">
                        <circle cx="80" cy="80" r="70" stroke="grey" stroke-width="8" fill="none" stroke-linecap="round" />
                      </svg>
                      <svg className={`border-0 circle-svg-${score}`} xmlns="http://www.w3.org/2000/svg" version="1.1" width="160px" height="160px">
                        <circle cx="80" cy="80" r="70" stroke={color} stroke-width="8" fill="none" stroke-linecap="round" />
                      </svg>
                    </div>
                  }
                  { level && <h4 className="mt-3 fw-semibold" style={{color:color}}>{level}</h4> }
                </Container>
              </Col>
              <Col className="d-flex m-0 p-0 flex-grow-1">
                <Container className="d-flex flex-column text-center p-4 bg-pure-white rounded shadow-sm">
                  <p className="fw-medium jakarta text-dark">Analysis</p>
                  {
                    problems && <p className="jakarta text-muted text-break">{problems}</p>
                  }
                </Container>
              </Col>
            </Row>
          </Container>
          { alternate && 
            <Container fluid className="border-bottom border-4 border-secondary mt-4 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-pure-white rounded shadow-sm">
              <p className="fw-medium jakarta text-dark">Alternate</p>
              <Container fluid className="w-100 bg-grey border-0 p-2 rounded">
                <p className="m-0 text-start">{alternate}</p>
              </Container>
            </Container>
          }
        </div>
      }
    </div>
  )
}

export default HomeScreen