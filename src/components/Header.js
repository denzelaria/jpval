import React, { useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Header = () => {
  const [ isOpen, setIsOpen ] = useState(false)

  return (
    <>
      <Container fluid className="z-3 p-3 fixed-top border-bottom border-2 bg-light">
        <nav className="d-flex justify-content-between align-items-center">
          <h4 className="text-dark m-0 fw-bold">jpval</h4>
          <div className="d-none d-md-flex gap-4 align-items-center">
            <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/'}>Evaluator</Link>
            <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/challenge'}>Challenge</Link>
            <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/extractor'}>Word Extractor</Link>
            <Link className="lnk jakarta text-muted fw-light text-decoration-none" to="https://github.com/denzelaria/jpval/">Github</Link>
          </div>
          <div></div>
          <Button className="p-0 d-md-none bg-transparent border-0 text-dark" onClick={() => setIsOpen(!isOpen)}>☰</Button>
        </nav>
      </Container>
      <nav className={`d-md-none d-flex ddn ${isOpen && 'active'} z-2 fixed-top w-100 p-3 bg-light flex-column text-start border-bottom border-2`}>
        <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/'}>Evaluator</Link>
        <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/challenge'}>Challenge</Link>
        <Link className="lnk jakarta text-muted fw-light text-decoration-none" to={'/extractor'}>Word Extractor</Link>
      </nav>
    </>
  )
}

export default Header