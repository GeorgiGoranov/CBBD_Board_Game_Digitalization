## Use Cases

# Table of Contents

1. [Log in](#log-in)
2. [Register](#register)
3. [Create Game Session](#create-game-session)
4. [Edit Game Session](#edit-game-session)
5. [Manage Rounds](#manage-rounds)
6. [Export/Save Outcomes](#exportsave-outcomes)
7. [Select Competency Cards](#select-competency-cards)
8. [Select Dilemma Cards](#select-dilemma-cards)
9. [Join Game Session](#join-game-session)

---

## Actors:
- **Moderator**: The user responsible for creating and managing game sessions.
- **Default User**: Anonymous participants who join game sessions.
---

<a name="log-in"></a>
| **Name**              | Log in                                             |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator logs into the system to gain access to create and manage game sessions. |
| **Pre-Condition**     | Moderator must have valid credentials.             |
| **Scenario**          | 1. Moderator inputs login details.<br>2. Clicks the login button. |
| **Result**            | The moderator is logged in.                        |

---
<a name="register"></a>

| **Name**              | Register                                           |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator registers for the system to be able to log in and create sessions. |
| **Pre-Condition**     | None                                               |
| **Scenario**          | 1. Moderator inputs required registration details.<br>2. Submits the registration form. |
| **Result**            | The moderator is registered and can now log in.    |

---
<a name="create-game-session"></a>

| **Name**              | Create Game Session                                |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator creates a new game session, defining game details and generating a game code. |
| **Pre-Condition**     | Moderator is logged in.                            |
| **Scenario**          | 1. Moderator navigates to the game session page.<br>2. Inputs game details.<br>3. Submits to create session and generates game code. |
| **Result**            | A new game session is created, and a game code is generated. |

---
<a name="edit-game-session"></a>

| **Name**              | Edit Game Session                                  |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator edits the game session details after creation. |
| **Pre-Condition**     | Game session has been created.                     |
| **Scenario**          | 1. Moderator selects a created game session.<br>2. Edits game details.<br>3. Saves the changes. |
| **Result**            | The game session is updated with the new details.  |

---
<a name="manage-rounds"></a>

| **Name**              | Manage Rounds                                      |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator manages and controls the rounds in the game session. |
| **Pre-Condition**     | Game session has been created.                     |
| **Scenario**          | 1. Moderator selects the game session.<br>2. Manages round settings (e.g., timers, content). |
| **Result**            | The rounds are managed and updated as per the moderator's input. |

---
<a name="exportsave-outcomes"></a>

| **Name**              | Export/Save Outcomes                               |
|-----------------------|----------------------------------------------------|
| **Description**       | The moderator exports or saves the outcomes of a game session. |
| **Pre-Condition**     | Game session has completed.                        |
| **Scenario**          | 1. Moderator selects the game session.<br>2. Chooses to export or save session outcomes.<br>3. Verifies the saved information. |
| **Result**            | The session outcomes are exported or saved.        |

---
<a name="select-competency-cards"></a>

| **Name**              | Select Competency Cards                            |
|-----------------------|----------------------------------------------------|
| **Description**       | Participants select competency cards during the game session as part of the round. |
| **Pre-Condition**     | Participant has joined the game session.           |
| **Scenario**          | 1. Participant views the list of competency cards.<br>2. Selects a card for the round. |
| **Result**            | The selected competency card is submitted for the round. |

---
<a name="select-dilemma-cards"></a>

| **Name**              | Select Dilemma Cards                               |
|-----------------------|----------------------------------------------------|
| **Description**       | Participants select dilemma cards during the game session. |
| **Pre-Condition**     | Participant has joined the game session.           |
| **Scenario**          | 1. Participant views the list of dilemma cards.<br>2. Selects a card for the round. |
| **Result**            | The selected dilemma card is submitted for the round. |

---
<a name="join-game-session"></a>

| **Name**              | Join Game Session                                  |
|-----------------------|----------------------------------------------------|
| **Description**       | The participant joins a game session using the game code provided by the moderator. |
| **Pre-Condition**     | A valid game session code is provided by the moderator. |
| **Scenario**          | 1. Participant inputs the game code.<br>2. Joins the game session. |
| **Result**            | The participant has joined the game session.       |
