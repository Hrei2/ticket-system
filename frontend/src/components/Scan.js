import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Button, Box, Card, CardContent } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api';

function Scan() {
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });
      scannerRef.current.render(onScanSuccess, onScanError);
    } else if (scannerRef.current) {
      scannerRef.current.clear();
    }
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      const res = await api.post('/scan', { qr_code: decodedText });
      setScanned(res.data);
      setScanning(false);
    } catch (err) {
      alert('Invalid ticket');
    }
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  return (
    <Container>
      <Typography variant="h4">Scan Ticket</Typography>
      <Button variant="contained" onClick={() => setScanning(!scanning)}>{scanning ? 'Stop' : 'Start'} Scan</Button>
      {scanning && <div id="reader" style={{ width: '100%' }}></div>}
      {scanned && (
        <Card sx={{ mt: 2, bgcolor: scanned.color }}>
          <CardContent>
            <Typography>Name: {scanned.name} {scanned.surname}</Typography>
            <Typography>Age: {scanned.age}</Typography>
            <Typography>Status: {scanned.status}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default Scan;