## Considerente etice

Dezvoltarea și operarea aplicației respectă principii fundamentale de confidențialitate, securitate cibernetică și accesibilitate, asigurând o utilizare transparentă și responsabilă pentru toți utilizatorii.

### Confidențialitate și protecția datelor (GDPR)
Aplicația aplică principiul minimizării datelor, colectând și stocând exclusiv informațiile strict necesare funcționării contului: adresa de e-mail și numele utilizatorului. Datele personale nu sunt vândute, închiriate sau partajate către terți în scopuri comerciale ori de publicitate. În conformitate cu Regulamentul General privind Protecția Datelor (GDPR), fiecare utilizator deține control deplin asupra propriilor informații și are posibilitatea de a-și șterge permanent contul și datele asociate în orice moment, direct din aplicație.

### Securitatea informațiilor
Pentru protejarea identității și a datelor utilizatorilor împotriva accesului neautorizat, parolele nu sunt stocate niciodată în format text clar, ci sunt criptate ireversibil (hashing) folosind algoritmul **bcrypt**. Sesiunile de lucru sunt gestionate printr-un mecanism securizat de autentificare bazat pe **JWT** (JSON Web Tokens). De asemenea, toate datele introduse de utilizatori sunt validate riguros atât la nivel de interfață, cât și pe server, prevenind vulnerabilitățile comune de securitate (precum injecțiile de cod sau introducerea de date corupte).

### Accesibilitate
Interfața aplicației este proiectată pentru a fi incluzivă și ușor de utilizat de către un public cât mai larg. Elementele vizuale respectă un raport de contrast ridicat pentru o lizibilitate optimă, câmpurile de introducere din formulare sunt însoțite de etichete clare și descriptive, iar întreaga aplicație permite navigarea completă și intuitivă exclusiv din tastatură.
