import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nhemygfseqjjspjyzbpw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZW15Z2ZzZXFqanNwanl6YnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTcwNTIsImV4cCI6MjA5NDQzMzA1Mn0.BT4RDcbAArsM0GLqWKPakM61vjNGiTq6wpozfze2GKM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)