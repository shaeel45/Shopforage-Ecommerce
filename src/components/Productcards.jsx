import React from 'react'
import { useEffect, useRef } from "react";
import style from './styles/Productcard.module.css'

const Productcards = (prop) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
  const container = containerRef.current;
  const card = cardRef.current;
  const title = titleRef.current;

  const handleMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (centerX - e.clientX) / 15;
    const y = (centerY - e.clientY) / 15;

    card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    card.style.transition = "none";
    title.style.transform = "translateZ(80px)";
  };

  const handleMouseLeave = () => {
    card.style.transition = "all 0.5s ease";
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
    title.style.transform = "translateZ(0px)";
  };

  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseenter", handleMouseEnter);
    container.removeEventListener("mouseleave", handleMouseLeave);
  };
  }, []);

  return (
      <div className={style.container} ref={containerRef}>
        <div className={style.card} ref={cardRef}>
          <h1 className={style.title} ref={titleRef}>
            {prop.title}
          </h1>

          <div  lassName={style.shoes}>
            <img src={prop.image} />
          </div>

          <div className={style.info}>
            <h3>{prop.description}</h3>
          </div>

          <div className={style.purchase}>
            <button>Purchase</button>
            <button>Add to cart</button>
          </div>
        </div>
      </div>
  );
}

export default Productcards