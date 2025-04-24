import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import io, { Socket } from 'socket.io-client';

// Types
type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
};

type Patient = {
  id: string;
  chatId: string;
  lastMessage?: string;
  unreadCount: number;
};

type ChatMessage = {
  chatId: string;
  message: Message;
};

type TypingEvent = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

const DoctorChat = () => {
  // State
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Refs
  const socket = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const doctorId = useRef<string>('main_doctor');
  
  // Connect to socket server
  useEffect(() => {
    socket.current = io('http://localhost:3000', {
      transports: ['websocket'],
      query: { userId: doctorId.current, userType: 'doctor' }
    });

    socket.current.on('connect', () => {
      console.log('Doctor connected');
      setIsConnecting(false);
    });

    socket.current.on('patientsList', (patientsList: Patient[]) => {
      console.log('Patients list:', patientsList);
      setPatients(patientsList);
    });

    socket.current.on('newPatient', (patient: Patient) => {
      console.log('New patient:', patient);
      setPatients(prev => [...prev.filter(p => p.id !== patient.id), patient]);
    });

    socket.current.on('patientUpdated', (patient: Patient) => {
      console.log('Updated patient:', patient);
      setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  // Handle chat with selected patient
  useEffect(() => {
    if (!socket.current || !selectedPatient) return;
    
    // Reset messages when switching patients
    setMessages([]);
    
    // Join chat and listen for messages
    socket.current.emit('joinChat', {
      patientId: selectedPatient.id,
      doctorId: doctorId.current,
    });
    
    socket.current.emit('viewingChat', {
      chatId: selectedPatient.chatId
    });
    
    // Event handlers
    const handlePreviousMessages = ({ chatId, messages: history }: { chatId: string; messages: Message[] }) => {
      if (selectedPatient.chatId === chatId && history) {
        setMessages(history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
    };
    
    const handleNewMessage = ({ chatId, message: data }: ChatMessage) => {
      if (selectedPatient.chatId === chatId) {
        setMessages(prev => [...prev, {...data, timestamp: new Date(data.timestamp)}]);
        setIsTyping(false);
      }
    };
    
    const handleTyping = ({ chatId, userId, isTyping: typing }: TypingEvent) => {
      if (selectedPatient.chatId === chatId && userId !== doctorId.current) {
        setIsTyping(typing);
      }
    };
    
    // Register listeners
    socket.current.on('previousMessages', handlePreviousMessages);
    socket.current.on('message', handleNewMessage);
    socket.current.on('typing', handleTyping);
    
    return () => {
      if (socket.current) {
        socket.current.off('previousMessages', handlePreviousMessages);
        socket.current.off('message', handleNewMessage);
        socket.current.off('typing', handleTyping);
      }
    };
  }, [selectedPatient]);

  // Select a patient and reset their unread count
  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatients(prev => prev.map(p => p.id === patient.id ? {...p, unreadCount: 0} : p));
  };

  // Send a message
  const sendMessage = () => {
    if (!message.trim() || !selectedPatient || !socket.current) return;
    
    const timestamp = new Date();
    
    // Don't add to local state - let the server broadcast handle it
    socket.current.emit('message', {
      text: message,
      chatId: selectedPatient.chatId,
      timestamp,
    });
    
    setMessage('');
  };

  // Format patient display name
  const formatPatientName = (id: string) => {
    const parts = id.split('_');
    return parts.length > 1 ? `Patient ${parts[1].slice(0, 5)}` : `Patient ${id.slice(0, 5)}`;
  };

  // Render a message bubble
  const MessageBubble = ({ message }: { message: Message }) => {
    const isFromDoctor = message.senderId === doctorId.current;
    
    return (
      <View className={`p-3 my-1 max-w-[75%] rounded-2xl ${isFromDoctor ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'}`}>
        <Text className={`${isFromDoctor ? 'text-white' : 'text-black'}`}>{message.text}</Text>
        <Text className={`text-xs mt-1 ${isFromDoctor ? 'text-blue-100' : 'text-gray-600'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {isConnecting ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4">Connecting...</Text>
        </View>
      ) : (
        <View className="flex-1 flex-row">
          {/* Patients sidebar */}
          <View className="w-[30%] border-r border-gray-200">
            <View className="p-3 bg-gray-100 border-b border-gray-200">
              <Text className="font-bold text-lg">Patients</Text>
            </View>
            <ScrollView>
              {patients.length === 0 ? (
                <Text className="p-4 text-center text-gray-600">No patients connected</Text>
              ) : (
                patients.map(patient => (
                  <TouchableOpacity
                    key={patient.id}
                    className={`p-3 border-b border-gray-100 ${selectedPatient?.id === patient.id ? 'bg-gray-50' : ''}`}
                    onPress={() => selectPatient(patient)}
                  >
                    <View className="flex-row justify-between">
                      <Text className="font-bold">{formatPatientName(patient.id)}</Text>
                      {patient.unreadCount > 0 && (
                        <View className="bg-red-500 rounded-full px-2 min-w-[20px] items-center">
                          <Text className="text-white text-xs font-bold">{patient.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                    {patient.lastMessage && (
                      <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>{patient.lastMessage}</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
          
          {/* Chat area */}
          <View className="flex-1">
            {selectedPatient ? (
              <>
                <View className="p-3 bg-gray-100">
                  <Text className="font-bold text-lg">{formatPatientName(selectedPatient.id)}</Text>
                </View>
                
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={({item}) => <MessageBubble message={item} />}
                  keyExtractor={item => item.id}
                  contentContainerStyle={{padding: 12}}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})}
                  className="flex-1"
                />
                
                {isTyping && (
                  <Text className="p-3 text-gray-600 italic">Patient is typing...</Text>
                )}
                
                <View className="p-3 border-t border-gray-200 bg-gray-100 flex-row">
                  <TextInput
                    className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-200"
                    value={message}
                    onChangeText={(text) => {
                      setMessage(text);
                      selectedPatient && socket.current?.emit('typing', {
                        chatId: selectedPatient.chatId,
                        isTyping: text.length > 0,
                      });
                    }}
                    placeholder="Type a message..."
                    multiline
                  />
                  <TouchableOpacity
                    className={`ml-2 bg-blue-500 rounded-full w-10 h-10 items-center justify-center ${!message.trim() ? 'opacity-50' : ''}`}
                    onPress={sendMessage}
                    disabled={!message.trim()}
                  >
                    <Text className="text-white font-bold">→</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-600 text-base">Select a patient to start chatting</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DoctorChat;