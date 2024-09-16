## Test Scenarios

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

<a name="log-in"></a>
| **Test Scenario**     | Log in                                             |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can log in to the system using valid credentials. |
| **Pre-Condition**     | The moderator has valid credentials.               |
| **Steps**             | 1. Navigate to the login page.<br>2. Enter valid credentials.<br>3. Click the "Log in" button. |
| **Expected Result**   | The moderator is logged in and redirected to the dashboard. |

---
<a name="register"></a>
| **Test Scenario**     | Register                                           |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can register an account. |
| **Pre-Condition**     | None                                               |
| **Steps**             | 1. Navigate to the registration page.<br>2. Enter valid registration details (e.g., email, password).<br>3. Submit the registration form. |
| **Expected Result**   | The moderator account is created, and a confirmation message is displayed. |

---
<a name="create-game-session"></a>
| **Test Scenario**     | Create Game Session                                |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can create a new game session with valid details. |
| **Pre-Condition**     | The moderator is logged in.                        |
| **Steps**             | 1. Navigate to the game session creation page.<br>2. Enter valid game details.<br>3. Click the "Create" button. |
| **Expected Result**   | A new game session is created, and a game code is generated. |

---
<a name="edit-game-session"></a>
| **Test Scenario**     | Edit Game Session                                  |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can edit an existing game session. |
| **Pre-Condition**     | The moderator has already created a game session.  |
| **Steps**             | 1. Navigate to the game session management page.<br>2. Select a game session to edit.<br>3. Modify session details.<br>4. Click the "Save" button. |
| **Expected Result**   | The game session details are successfully updated. |

---
<a name="manage-rounds"></a>
| **Test Scenario**     | Manage Rounds                                      |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can manage rounds within a game session. |
| **Pre-Condition**     | The game session is active, and rounds are available for management. |
| **Steps**             | 1. Navigate to the round management page.<br>2. Select a round to manage.<br>3. Update the round settings.<br>4. Save changes. |
| **Expected Result**   | The round settings are successfully updated, and changes are reflected in the game session. |

---
<a name="exportsave-outcomes"></a>
| **Test Scenario**     | Export/Save Outcomes                               |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that the moderator can export or save the outcomes of a completed game session. |
| **Pre-Condition**     | The game session is completed.                     |
| **Steps**             | 1. Navigate to the game session outcomes page.<br>2. Click the "Export" or "Save" button.<br>3. Verify that the outcomes are exported or saved. |
| **Expected Result**   | The game outcomes are successfully exported or saved. |

---
<a name="select-competency-cards"></a>
| **Test Scenario**     | Select Competency Cards                            |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that participants can select competency cards during the game session. |
| **Pre-Condition**     | The participant is in the game session.            |
| **Steps**             | 1. Display the list of competency cards.<br>2. Select a competency card.<br>3. Submit the selection. |
| **Expected Result**   | The competency card is successfully selected and submitted for the round. |

---
<a name="select-dilemma-cards"></a>
| **Test Scenario**     | Select Dilemma Cards                               |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that participants can select dilemma cards during the game session. |
| **Pre-Condition**     | The participant is in the game session.            |
| **Steps**             | 1. Display the list of dilemma cards.<br>2. Select a dilemma card.<br>3. Submit the selection. |
| **Expected Result**   | The dilemma card is successfully selected and submitted for the round. |

---
<a name="join-game-session"></a>
| **Test Scenario**     | Join Game Session                                  |
|-----------------------|----------------------------------------------------|
| **Description**       | Verify that participants can join a game session using a valid game code. |
| **Pre-Condition**     | A valid game session code is provided by the moderator. |
| **Steps**             | 1. Navigate to the game session join page.<br>2. Enter the game code.<br>3. Click the "Join" button. |
| **Expected Result**   | The participant successfully joins the game session and is ready to participate. |

