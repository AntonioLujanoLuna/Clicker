import React from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';
import { DynamicEvent } from '../data/dynamicEvents';

const PanelContainer = styled.div`
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 8px;
  color: #fff;
  margin-top: 20px;
`;

const EventCard = styled.div<{ resolved: boolean }>`
  background-color: ${props => props.resolved ? '#444' : '#222'};
  border: 1px solid #333;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #444;
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const EventTitle = styled.h3`
  margin: 0;
  color: #0f0;
`;

const EventDescription = styled.p`
  color: #ccc;
  margin: 10px 0;
`;

const Button = styled.button`
  background-color: #0f0;
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0d0;
  }

  &:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
`;

const DynamicEventsPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const { dynamicEvents } = state;

  const handleResolve = (eventId: string) => {
    dispatch({ type: 'RESOLVE_DYNAMIC_EVENT', eventId });
  };

  return (
    <PanelContainer>
      <h2>Dynamic Events</h2>
      {dynamicEvents.length === 0 ? (
        <p>No active events at the moment.</p>
      ) : (
        dynamicEvents.map((event: DynamicEvent) => (
          <EventCard key={event.id} resolved={event.resolved}>
            <EventHeader>
              <EventTitle>{event.name}</EventTitle>
            </EventHeader>
            <EventDescription>{event.description}</EventDescription>
            {event.reward && (
              <p>Reward: {event.reward.amount} {event.reward.type}</p>
            )}
            {!event.resolved && (
              <Button onClick={() => handleResolve(event.id)}>Resolve Event</Button>
            )}
          </EventCard>
        ))
      )}
    </PanelContainer>
  );
};

export default DynamicEventsPanel; 