import React, { useState } from 'react'; import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'

interface ReferralProbabilities {
    single: number,
    couple: number,
    family: number,
    largeFamily: number
}

interface SimulationParams {
    numberOfDays: number,
    numberOfSimulations: number,
    restockQuantity: number,
    referralProbabilities: ReferralProbabilities
}

interface SimulationAPIResponse {
    avgNumberOfUnfulfilledReferrals: number;
    avgNumberOfExpiredBoxes: number;
    avgNumberOfDeliveriesPerDay: number;
}


export default function InputFields({ handleSimulationResponse }: any): JSX.Element {
    const [simulationParams, setSimulationParams] = useState({} as SimulationParams)

    async function getSimulationResult(url: string, request: SimulationParams): Promise<SimulationAPIResponse> {
        const response: Response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        const apiResponseJson = await response.json();
        return apiResponseJson
    }

    async function handleSimulationClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        const response: SimulationAPIResponse = await getSimulationResult('http://localhost:3001/api/simulation', simulationParams)
        handleSimulationResponse(response)
    }

    return (
        <div>
            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <h1>
                        Simulation Parameters
                    </h1>
                    <div>
                        <TextField
                            required
                            id="outlined-required"
                            label="Number of Days"
                            onChange={(e) => setSimulationParams({ ...simulationParams, numberOfDays: parseInt(e.target.value) })}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Number of Simulations"
                            onChange={(e) => setSimulationParams({ ...simulationParams, numberOfSimulations: parseInt(e.target.value) })}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Restock Quantity"
                            onChange={(e) => setSimulationParams({ ...simulationParams, restockQuantity: parseInt(e.target.value) })}
                        />
                    </div>
                    <h1>
                        Referral Probabilities
                    </h1>
                    <div>
                        <TextField
                            required
                            id="outlined-required"
                            label="Single Food Box Referral Probability"
                            onChange={(e) => setSimulationParams({ ...simulationParams, referralProbabilities: { ...simulationParams.referralProbabilities, single: parseFloat(e.target.value) } })}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Couple Food Box Referral Probability"
                            onChange={(e) => setSimulationParams({ ...simulationParams, referralProbabilities: { ...simulationParams.referralProbabilities, couple: parseFloat(e.target.value) } })}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Family Food Box Referral Probability"
                            onChange={(e) => setSimulationParams({ ...simulationParams, referralProbabilities: { ...simulationParams.referralProbabilities, family: parseFloat(e.target.value) } })}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Large Family Food Box Referral Probability"
                            onChange={(e) => setSimulationParams({ ...simulationParams, referralProbabilities: { ...simulationParams.referralProbabilities, largeFamily: parseFloat(e.target.value) } })}
                        />
                    </div>
                </div>
                <Button style={{ marginTop: '20px' }} onClick={handleSimulationClick}>Run Simulation</Button>
            </Box >
        </div>
    );
}