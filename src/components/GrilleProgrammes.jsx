import React from 'react';
import { motion } from 'framer-motion';

function GrilleProgrammes() {
  const programmes = [
    {
      time: '7h - 13h',
      content: [
        { type: 'title', text: '« Dieu tu es mon Dieu je te cherche dès l\'aube »' },
        { type: 'program', text: '7h : Prière de l\'angélus' },
        { type: 'program', text: 'Chapelet - Mystères Joyeux' },
        { type: 'program', text: 'Le Saint du jour' },
        { type: 'program', text: 'L\'Évangile du jour' },
        { type: 'program', text: '12h : Prière de l\'angélus' },
        { type: 'program', text: 'Mystères douloureux' }
      ]
    },
    {
      time: '13h - 00h',
      content: [
        { type: 'title', text: '« Louez le Seigneur »' },
        { type: 'program', text: 'Une journée de louange non-stop' },
        { type: 'program', text: '15h : Chapelet à la miséricorde divine' },
        { type: 'program', text: '18h : Les mystères glorieux' },
        { type: 'program', text: 'Vendredi 10h - 15h : Aux pieds de la croix avec Jésus' },
        { type: 'program', text: 'Vendredi 14h30 : Le chemin de croix' },
        { type: 'program', text: 'Samedi 10h - 15h : Le samedi de la Vierge Marie' },
        { type: 'program', text: 'Dimanche 10h - 15h : Les plus beaux cantiques liturgiques' }
      ]
    },
    {
      time: '22h - 1h',
      content: [
        { type: 'title', text: 'Live TikTok / Twitch / Discord' },
        { type: 'program', text: 'La libre antenne' },
        { type: 'program', text: '22h : Psaumes des complies' }
      ]
    },
    {
      time: '1h - 7h',
      content: [
        { type: 'title', text: '🌙 Heaven Night' },
        { type: 'program', text: '3h : Chapelet à la miséricorde divine' },
        { type: 'program', text: '5h : Les mystères lumineux' },
        { type: 'program', text: 'Ambiance nocturne spirituelle' }
      ]
    }
  ];

  return (
    <motion.div 
      className="grille-programmes"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <div className="grille-container">
        {programmes.map((slot, index) => (
          <motion.div 
            key={index}
            className="time-slot"
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="time-label">
              {slot.time}
            </div>
            <div className="program-content">
              {slot.content.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={`program-item ${item.type}`}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default GrilleProgrammes;